import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-home-page',
   standalone: true,
   imports: [RouterLink, NgIcon],
   templateUrl: './home-page.component.html',
   styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements AfterViewInit {
   ngAfterViewInit() {
      const cards = document.querySelectorAll('.feature-card');

      // Gắn class reveal để chuẩn bị cho hiệu ứng cuộn
      cards.forEach((card) => card.classList.add('reveal'));

      const observer = new IntersectionObserver(
         (entries, obs) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  // Kích hoạt hiệu ứng hiện
                  entry.target.classList.add('active');
                  // Ngừng theo dõi
                  obs.unobserve(entry.target);
               }
            });
         },
         { threshold: 0.2 },
      );

      cards.forEach((card) => observer.observe(card));
   }
}
