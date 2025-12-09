using System.Text;
using DocumentFormat.OpenXml.Packaging;
using UglyToad.PdfPig;

namespace NjalaAPI.Services
{
    public class DocumentTextExtractor
    {
        public async Task<string> ExtractTextAsync(IFormFile file)
        {
            var ext = Path.GetExtension(file.FileName).ToLower();
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            return ext switch
            {
                ".txt" => Encoding.UTF8.GetString(stream.ToArray()),
                ".pdf" => ExtractTextFromPdf(stream),
                ".docx" => ExtractTextFromDocx(stream),
                _ => $"[Unsupported file type: {ext}]. Please add text extraction for this format."
            };
        }

        private string ExtractTextFromPdf(Stream pdfStream)
        {
            StringBuilder text = new StringBuilder();

            using (var document = UglyToad.PdfPig.PdfDocument.Open(pdfStream))
            {
                foreach (var page in document.GetPages())
                    text.AppendLine(page.Text);
            }

            return string.IsNullOrWhiteSpace(text.ToString())
                ? "[No readable text found in PDF. It may be image-based or scanned.]"
                : text.ToString();
        }

        private string ExtractTextFromDocx(Stream docxStream)
        {
            StringBuilder text = new StringBuilder();

            using (var doc = WordprocessingDocument.Open(docxStream, false))
            {
                var body = doc.MainDocumentPart?.Document?.Body;
                if (body != null)
                    text.Append(body.InnerText);
            }

            return string.IsNullOrWhiteSpace(text.ToString())
                ? "[No readable text found in DOCX file.]"
                : text.ToString();
        }
    }
}
