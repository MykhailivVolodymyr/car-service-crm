using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Infrastructure.Context
{
    public static class SeedDataExtensions
    {
        public static void SeedInitialData(this ModelBuilder modelBuilder)
        {
            // 1. Ролі користувачів
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Менеджер" },
                new Role { Id = 2, Name = "Майстер" }
            );

            // 2. Статуси замовлень
            modelBuilder.Entity<Status>().HasData(
                new Status { Id = 1, Name = "Новий" },
                new Status { Id = 2, Name = "В роботі" },
                new Status { Id = 3, Name = "Очікує запчастини" },
                new Status { Id = 4, Name = "Готово" },
                new Status { Id = 5, Name = "Закрито" }
            );

            // 3. Категорії послуг
            modelBuilder.Entity<ServiceCategory>().HasData(
                new ServiceCategory { Id = 1, Name = "Технічне обслуговування" },
                new ServiceCategory { Id = 2, Name = "Ходова частина" },
                new ServiceCategory { Id = 3, Name = "Двигун та трансмісія" },
                new ServiceCategory { Id = 4, Name = "Електрообладнання" },
                new ServiceCategory { Id = 5, Name = "Діагностика" }
            );

            // 4. Категорії запчастин
            modelBuilder.Entity<PartCategory>().HasData(
                new PartCategory { Id = 1, Name = "Фільтри та оливи" },
                new PartCategory { Id = 2, Name = "Гальмівна система" },
                new PartCategory { Id = 3, Name = "Підвіска та рульове" },
                new PartCategory { Id = 4, Name = "Освітлення та електрика" },
                new PartCategory { Id = 5, Name = "Кузовні елементи" }
            );
        }
    }
}

