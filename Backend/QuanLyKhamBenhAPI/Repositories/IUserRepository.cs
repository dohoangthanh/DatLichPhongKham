using System.Collections.Generic;
using System.Threading.Tasks;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Repositories
{
    public interface IUserRepository
    {
        Task<UserAccount?> GetByUsernameAsync(string username);
        Task<IEnumerable<UserAccount>> GetAllAsync();
        Task AddAsync(UserAccount user);
        Task UpdateAsync(UserAccount user);
        Task DeleteAsync(int userId);
    }
}