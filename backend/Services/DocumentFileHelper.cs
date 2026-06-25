namespace NjalaAPI.Services
{
    public static class DocumentFileHelper
    {
        public static string ResolveDocumentPath(string storedPath)
        {
            if (string.IsNullOrWhiteSpace(storedPath))
                throw new FileNotFoundException("Document path is empty.");

            if (Path.IsPathRooted(storedPath) && File.Exists(storedPath))
                return storedPath;

            var fileName = Path.GetFileName(storedPath);
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", fileName);
            if (File.Exists(uploadsPath))
                return uploadsPath;

            var relativePath = Path.Combine(Directory.GetCurrentDirectory(), storedPath);
            if (File.Exists(relativePath))
                return relativePath;

            throw new FileNotFoundException($"Document file not found: {storedPath}");
        }

        public static string GetContentType(string path)
        {
            return Path.GetExtension(path).ToLowerInvariant() switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream"
            };
        }

        public static string SanitizeFileName(string fileName)
        {
            foreach (var c in Path.GetInvalidFileNameChars())
                fileName = fileName.Replace(c, '_');
            return fileName;
        }
    }
}
