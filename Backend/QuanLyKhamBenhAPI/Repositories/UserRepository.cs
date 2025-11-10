using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuanLyKhamBenhAPI.Models;

namespace QuanLyKhamBenhAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly QuanLyKhamBenhContext _context;

        public UserRepository(QuanLyKhamBenhContext context)
        {
            _context = context;
        }

        public async Task<UserAccount> GetByUsernameAsync(string username)
        {
            return await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<UserAccount>> GetAllAsync()
        {
            return await _context.UserAccounts.ToListAsync();
        }

        public async Task AddAsync(UserAccount user)
        {
            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(UserAccount user)
        {
            _context.UserAccounts.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int userId)
        {
            var user = await _context.UserAccounts.FindAsync(userId);
            if (user != null)
            {
                _context.UserAccounts.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}