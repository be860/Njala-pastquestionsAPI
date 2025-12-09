using System.Threading.Tasks;

public interface IDashboardService
{
    Task<object> GetStudentDashboardSummaryAsync(string userId);
}
