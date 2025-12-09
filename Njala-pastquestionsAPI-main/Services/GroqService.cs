using System.Text;
using System.Text.Json;

namespace NjalaAPI.Services
{
    public class GroqService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private const int MAX_TOKENS_PER_REQUEST = 10000; // Adjust based on testing and API limits

        public GroqService(IConfiguration config)
        {
            var apiKey = config["Groq:ApiKey"];
            _baseUrl = config["Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1"; // Fixed trailing space
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        // 🔹 Summarize extracted text from uploaded document
        public async Task<string> SummarizeDocumentAsync(string text)
        {
            // Split the text into smaller chunks to avoid TPM limits
            var chunks = SplitText(text, MAX_TOKENS_PER_REQUEST);
            var summaries = new List<string>();

            foreach (var chunk in chunks)
            {
                var body = new
                {
                    model = "llama-3.3-70b-versatile",
                    messages = new[]
                    {
                        new { role = "system", content = "Summarize this academic document in 3-5 sentences. Include main topics and insights for students." },
                        new { role = "user", content = chunk }
                    }
                };

                var response = await _httpClient.PostAsync(
                        $"{_baseUrl}/chat/completions",
                 new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
                );

                var result = await response.Content.ReadAsStringAsync();

                using var json = JsonDocument.Parse(result);

                // ✅ Handle possible error response gracefully
                if (json.RootElement.TryGetProperty("error", out var error))
                {
                    var message = error.GetProperty("message").GetString();
                    throw new Exception($"Groq API error: {message}");
                }

                // ✅ Ensure 'choices' array exists
                if (!json.RootElement.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
                    throw new Exception($"Unexpected API response: {result}");

                var content = choices[0].GetProperty("message").GetProperty("content").GetString();
                summaries.Add(content ?? "No content returned from AI summarizer.");
            }

            // Combine summaries from all chunks
            return string.Join("\n\n", summaries);
        }

        // 🔹 AI Tutor: Answer a question
        public async Task<string> AskTutorAsync(string question)
        {
            var body = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[]
                {
                    new { role = "system", content = "You are an academic tutor. Give clear, short explanations to university students." },
                    new { role = "user", content = question }
                }
            };

            var response = await _httpClient.PostAsync(
                $"{_baseUrl}/chat/completions",
                new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            );

            var result = await response.Content.ReadAsStringAsync();
            using var json = JsonDocument.Parse(result);

            // ✅ Handle possible error response gracefully
            if (json.RootElement.TryGetProperty("error", out var error))
            {
                var message = error.GetProperty("message").GetString();
                throw new Exception($"Groq API error: {message}");
            }

            // ✅ Ensure 'choices' array exists
            if (!json.RootElement.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
                throw new Exception($"Unexpected API response: {result}");

            return json.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }

        /// <summary>
        /// Splits a large text into smaller chunks of specified size.
        /// </summary>
        /// <param name="text">The text to split.</param>
        /// <param name="chunkSize">The maximum size of each chunk.</param>
        /// <returns>A list of text chunks.</returns>
        private List<string> SplitText(string text, int chunkSize)
        {
            var chunks = new List<string>();

            if (string.IsNullOrEmpty(text))
            {
                return chunks; // Return empty list for null or empty input
            }

            for (int i = 0; i < text.Length; i += chunkSize)
            {
                // Calculate the end index for the current chunk
                int endIndex = Math.Min(i + chunkSize, text.Length);

                // Extract the chunk
                string chunk = text.Substring(i, endIndex - i);

                // Add the chunk to the list
                chunks.Add(chunk);
            }

            return chunks;
        }
    }
}
