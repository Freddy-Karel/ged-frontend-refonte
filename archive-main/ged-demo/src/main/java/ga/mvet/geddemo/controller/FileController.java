package ga.mvet.geddemo.controller;

import ga.mvet.geddemo.model.Document;
import ga.mvet.geddemo.service.DocumentConversionService;
import ga.mvet.geddemo.service.DocumentService;
import ga.mvet.geddemo.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;
    private final DocumentConversionService documentConversionService;

    public FileController(
            DocumentService documentService,
            FileStorageService fileStorageService,
            DocumentConversionService documentConversionService
    ) {
        this.documentService = documentService;
        this.fileStorageService = fileStorageService;
        this.documentConversionService = documentConversionService;
    }

    @GetMapping("/documents/{documentId}/preview")
    public ResponseEntity<?> previewDocument(
            @PathVariable Long documentId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            HttpServletRequest request
    ) {
        Document document = documentService.findEntityById(documentId);

        if (Boolean.TRUE.equals(document.getExternalDocument()) && hasText(document.getExternalUrl())) {
            return ResponseEntity.status(302)
                    .location(URI.create(document.getExternalUrl()))
                    .build();
        }

        if (!hasText(document.getStoredFileName())) {
            return ResponseEntity.badRequest().body("Aucun fichier disponible pour la prévisualisation.");
        }

        try {
            String storedFileName = document.getStoredFileName();
            String mimeType = document.getMimeType();

            if (fileStorageService.isPreviewableDirectly(mimeType, storedFileName)) {
                Resource resource = fileStorageService.loadAsResource(storedFileName);
                Path filePath = fileStorageService.resolveStoredFilePath(storedFileName);

                return serveResource(
                        resource,
                        filePath,
                        fileStorageService.resolveMediaType(storedFileName, mimeType),
                        resolveFileName(document),
                        true,
                        rangeHeader,
                        isHeadRequest(request)
                );
            }

            if (fileStorageService.isOfficeConvertible(storedFileName)) {
                if (!documentConversionService.isConversionAvailable()) {
                    return ResponseEntity.badRequest().body(
                            "La conversion Office vers PDF n'est pas disponible. Vérifiez LibreOffice."
                    );
                }

                Path previewPdf = documentConversionService.getOrCreatePdfPreview(storedFileName);
                Resource previewResource = new UrlResource(previewPdf.toUri());

                return serveResource(
                        previewResource,
                        previewPdf,
                        MediaType.APPLICATION_PDF,
                        buildPreviewFileName(resolveFileName(document)),
                        true,
                        rangeHeader,
                        isHeadRequest(request)
                );
            }

            return ResponseEntity.badRequest().body(
                    "Ce type de document n'est pas prévisualisable directement dans l'application."
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la prévisualisation : " + e.getMessage());
        }
    }

    @GetMapping("/documents/{documentId}/open")
    public ResponseEntity<?> openDocument(
            @PathVariable Long documentId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            HttpServletRequest request
    ) {
        Document document = documentService.findEntityById(documentId);
        return serveOriginalDocument(document, true, rangeHeader, isHeadRequest(request));
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long documentId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            HttpServletRequest request
    ) {
        Document document = documentService.findEntityById(documentId);
        return serveOriginalDocument(document, false, rangeHeader, isHeadRequest(request));
    }

    private ResponseEntity<?> serveOriginalDocument(Document document, boolean inline, String rangeHeader, boolean headRequest) {
        if (Boolean.TRUE.equals(document.getExternalDocument()) && hasText(document.getExternalUrl())) {
            return ResponseEntity.status(302)
                    .location(URI.create(document.getExternalUrl()))
                    .build();
        }

        if (!hasText(document.getStoredFileName())) {
            if (hasText(document.getFilePath())) {
                return ResponseEntity.status(302)
                        .location(URI.create(document.getFilePath()))
                        .build();
            }

            return ResponseEntity.badRequest().body(
                    inline
                            ? "Aucun contenu document n'est disponible pour ouverture."
                            : "Aucun contenu document n'est disponible pour téléchargement."
            );
        }

        try {
            Resource resource = fileStorageService.loadAsResource(document.getStoredFileName());
            Path filePath = fileStorageService.resolveStoredFilePath(document.getStoredFileName());
            MediaType mediaType = fileStorageService.resolveMediaType(
                    document.getStoredFileName(),
                    document.getMimeType()
            );

            return serveResource(
                    resource,
                    filePath,
                    mediaType,
                    resolveFileName(document),
                    inline,
                    rangeHeader,
                    headRequest
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la lecture du fichier demandé : " + e.getMessage());
        }
    }

    private ResponseEntity<?> serveResource(
            Resource resource,
            Path filePath,
            MediaType mediaType,
            String fileName,
            boolean inline,
            String rangeHeader,
            boolean headRequest
    ) throws Exception {

        final long maxChunkSizeBytes = 1024L * 1024L; // 1MB
        long contentLength = Files.size(filePath);
        String contentTypeHeaderValue = mediaType != null
                ? mediaType.toString()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String diagnosticHandlerHeader = "range-handler-v3";
        ContentDisposition disposition = inline
                ? ContentDisposition.inline().filename(fileName, StandardCharsets.UTF_8).build()
                : ContentDisposition.attachment().filename(fileName, StandardCharsets.UTF_8).build();

        if (isStreamableMedia(mediaType) && hasText(rangeHeader)) {
            try {
                List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
                if (!ranges.isEmpty()) {
                    HttpRange range = ranges.get(0);
                    long start = range.getRangeStart(contentLength);
                    long end = range.getRangeEnd(contentLength);

                    // Avoid allocating huge byte arrays when the client requests "bytes=start-".
                    if (end >= contentLength - 1) {
                        end = Math.min(end, start + maxChunkSizeBytes - 1);
                    }

                    long regionLength = end - start + 1;

                    if (headRequest) {
                        return ResponseEntity.status(206)
                                .header(HttpHeaders.CONTENT_TYPE, contentTypeHeaderValue)
                                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                                .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + contentLength)
                                .header("X-GED-Preview", diagnosticHandlerHeader)
                                .contentLength(regionLength)
                                .build();
                    }

                    byte[] data = new byte[(int) regionLength];
                    try (FileChannel channel = FileChannel.open(filePath, StandardOpenOption.READ)) {
                        channel.position(start);
                        int offset = 0;
                        while (offset < data.length) {
                            int read = channel.read(java.nio.ByteBuffer.wrap(data, offset, data.length - offset));
                            if (read < 0) break;
                            offset += read;
                        }
                    }

                    return ResponseEntity.status(206)
                            .header(HttpHeaders.CONTENT_TYPE, contentTypeHeaderValue)
                            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                            .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + contentLength)
                            .header("X-GED-Preview", diagnosticHandlerHeader)
                            .contentLength(regionLength)
                            .body(data);
                }
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(416)
                        .header(HttpHeaders.CONTENT_TYPE, contentTypeHeaderValue)
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + contentLength)
                        .header("X-GED-Preview", diagnosticHandlerHeader)
                        .build();
            } catch (Exception ignored) {
                // Fallback: if range processing fails for any reason, return full content instead of 500.
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, contentTypeHeaderValue)
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header("X-GED-Preview", diagnosticHandlerHeader)
                        .contentLength(contentLength)
                        .body(headRequest ? null : resource);
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentTypeHeaderValue)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header("X-GED-Preview", diagnosticHandlerHeader)
                .contentLength(contentLength)
                .body(headRequest ? null : resource);
    }

    private boolean isHeadRequest(HttpServletRequest request) {
        return request != null && "HEAD".equalsIgnoreCase(request.getMethod());
    }

    private boolean isStreamableMedia(MediaType mediaType) {
        return mediaType != null
                && ("video".equalsIgnoreCase(mediaType.getType())
                || "audio".equalsIgnoreCase(mediaType.getType()));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String resolveFileName(Document document) {
        if (hasText(document.getOriginalFileName())) {
            return document.getOriginalFileName();
        }

        if (hasText(document.getStoredFileName())) {
            return document.getStoredFileName();
        }

        if (hasText(document.getTitle())) {
            return document.getTitle() + ".bin";
        }

        return "document.bin";
    }

    private String buildPreviewFileName(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        String baseName = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
        return baseName + ".preview.pdf";
    }
}