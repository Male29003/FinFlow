using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ISignalRNotificationService
    {
        Task SendTransactionChangedNotificationAsync(int userId);
    }
}