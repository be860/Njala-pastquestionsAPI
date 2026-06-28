using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NjalaAPI.Data;
using NjalaAPI.Models;

namespace NjalaAPI.Services
{
    public class DocumentSearchService
    {
        private readonly AppDbContext _context;
        private readonly DocumentTextExtractor _textExtractor;

        private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "can", "you", "help", "me", "the", "a", "an", "from", "with", "take", "key", "topics",
            "past", "questions", "question", "name", "and", "for", "this", "that", "what", "how",
            "is", "are", "of", "in", "on", "my", "i", "please", "about", "find", "show", "give",
            "list", "explain", "summarize", "summary", "document", "paper", "exam", "available",
            "system", "tutor", "assistant", "study", "using", "into", "out", "all", "any"
        };

        public DocumentSearchService(AppDbContext context, DocumentTextExtractor textExtractor)
        {
            _context = context;
            _textExtractor = textExtractor;
        }

        public async Task<Document?> FindBestMatchAsync(string question, int? explicitDocumentId = null)
        {
            if (explicitDocumentId.HasValue)
                return await _context.Documents.FindAsync(explicitDocumentId.Value);

            if (!LooksLikeDocumentQuestion(question))
                return null;

            var documents = await _context.Documents.AsNoTracking().ToListAsync();
            if (documents.Count == 0)
                return null;

            int? year = ExtractYear(question);
            var tokens = Tokenize(question);

            Document? best = null;
            var bestScore = 0;

            foreach (var doc in documents)
            {
                var score = ScoreDocument(doc, question, tokens, year);
                if (score > bestScore)
                {
                    bestScore = score;
                    best = doc;
                }
            }

            return bestScore >= 6 ? best : null;
        }

        public static bool LooksLikeDocumentQuestion(string question)
        {
            var lower = question.ToLowerInvariant();
            return Regex.IsMatch(lower, @"\b(19|20)\d{2}\b")
                || lower.Contains("past question")
                || lower.Contains("past paper")
                || lower.Contains("past exam")
                || lower.Contains("exam paper")
                || lower.Contains("document")
                || lower.Contains("pdf");
        }

        public async Task<string> BuildDocumentContextAsync(Document doc)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Title: {doc.Title}");
            sb.AppendLine($"Course Code: {doc.CourseCode}");
            sb.AppendLine($"Year: {doc.Year}");

            if (!string.IsNullOrWhiteSpace(doc.Description))
                sb.AppendLine($"Description: {doc.Description}");

            if (!string.IsNullOrWhiteSpace(doc.Summary))
                sb.AppendLine($"AI Summary:\n{doc.Summary}");

            try
            {
                var path = DocumentFileHelper.ResolveDocumentPath(doc.FilePath);
                var text = await _textExtractor.ExtractTextFromPathAsync(path);
                if (!string.IsNullOrWhiteSpace(text)
                    && !text.StartsWith('[')
                    && text.Length > 50)
                {
                    const int maxChars = 12000;
                    var excerpt = text.Length > maxChars
                        ? text[..maxChars] + "\n...[document text truncated for length]"
                        : text;
                    sb.AppendLine($"Document Content:\n{excerpt}");
                }
            }
            catch
            {
                // Summary/metadata is still useful if file extraction fails.
            }

            return sb.ToString();
        }

        private static int? ExtractYear(string question)
        {
            var match = Regex.Match(question, @"\b(19|20)\d{2}\b");
            return match.Success && int.TryParse(match.Value, out var year) ? year : null;
        }

        private static List<string> Tokenize(string question)
        {
            return Regex.Split(question.ToLowerInvariant(), @"\W+")
                .Where(t => t.Length > 2 && !StopWords.Contains(t))
                .Distinct()
                .ToList();
        }

        private static int ScoreDocument(Document doc, string question, List<string> tokens, int? year)
        {
            var score = 0;
            var lowerQuestion = question.ToLowerInvariant();
            var haystack = $"{doc.Title} {doc.Description} {doc.CourseCode} {doc.Summary}".ToLowerInvariant();

            if (year.HasValue && doc.Year == year.Value)
                score += 12;

            foreach (var token in tokens)
            {
                if (haystack.Contains(token, StringComparison.OrdinalIgnoreCase))
                    score += 3;
            }

            foreach (var titleToken in Regex.Split(doc.Title, @"\W+").Where(t => t.Length > 2))
            {
                if (lowerQuestion.Contains(titleToken.ToLowerInvariant()))
                    score += 6;
            }

            if (lowerQuestion.Contains(doc.Title.ToLowerInvariant()))
                score += 15;

            if (!string.IsNullOrWhiteSpace(doc.CourseCode)
                && lowerQuestion.Contains(doc.CourseCode.ToLowerInvariant()))
                score += 8;

            return score;
        }
    }
}
