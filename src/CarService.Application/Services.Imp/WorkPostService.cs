using AutoMapper;
using CarService.Application.DTOs.WorkPost.CreateWorkPost;
using CarService.Application.DTOs.WorkPost.GetWorkPost;
using CarService.Application.Exceptions;
using CarService.Domain.Abstractions;
using CarService.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarService.Application.Services.Imp
{
    public class WorkPostService : IWorkPostService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public WorkPostService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<WorkPostDto>> GetAllAsync(bool onlyActive = false)
        {
            var posts = onlyActive
                ? await _unitOfWork.WorkPosts.GetAsync(p => p.IsActive == true)
                : await _unitOfWork.WorkPosts.GetAllAsync();

            return _mapper.Map<IEnumerable<WorkPostDto>>(posts);
        }

        public async Task<WorkPostDto> GetByIdAsync(int id)
        {
            var post = await _unitOfWork.WorkPosts.GetByIdAsync(id);
            if (post == null) throw new NotFoundException($"Робочий пост з ID {id} не знайдено.");
            return _mapper.Map<WorkPostDto>(post);
        }

        public async Task<WorkPostDto> CreateAsync(CreateWorkPostDto dto)
        {
            var post = _mapper.Map<WorkPost>(dto);
            await _unitOfWork.WorkPosts.AddAsync(post);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<WorkPostDto>(post);
        }

        public async Task UpdateAsync(int id, CreateWorkPostDto dto)
        {
            var post = await _unitOfWork.WorkPosts.GetByIdAsync(id);
            if (post == null) throw new NotFoundException($"Робочий пост з ID {id} не знайдено.");

            post.Name = dto.Name;
            post.IsActive = dto.IsActive;

            _unitOfWork.WorkPosts.Update(post);
            await _unitOfWork.CompleteAsync();
        }

        public async Task ToggleStatusAsync(int id)
        {
            var post = await _unitOfWork.WorkPosts.GetByIdAsync(id);
            if (post == null) throw new NotFoundException($"Робочий пост з ID {id} не знайдено.");

            post.IsActive = !(post.IsActive ?? false);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var post = await _unitOfWork.WorkPosts.GetByIdAsync(id);
            if (post == null) throw new NotFoundException($"Робочий пост з ID {id} не знайдено.");

            //var hasSchedules = await _unitOfWork.Schedules.AnyAsync(s => s.WorkPostId == id);
            //if (hasSchedules)
            //    throw new BadRequestException("Неможливо видалити пост, який має історію записів. Краще зробіть його неактивним.");

            _unitOfWork.WorkPosts.Delete(post);
            await _unitOfWork.CompleteAsync();
        }
    }
}
