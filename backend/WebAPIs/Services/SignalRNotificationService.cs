using Application.Interface;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using WebAPIs.Hubs;

namespace WebAPIs.Services
{
    // Class này nằm ở WebAPIs nên thoải mái gọi SignalR
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<TransactionHub> _hubContext;

        public SignalRNotificationService(IHubContext<TransactionHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendTransactionChangedNotificationAsync(int userId)
        {
            await _hubContext.Clients.All.SendAsync("OnTransactionChanged", userId);
        }
    }
}