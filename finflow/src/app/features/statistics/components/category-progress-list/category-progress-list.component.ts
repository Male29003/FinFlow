import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-category-progress-list',
   standalone: true,
   imports: [CommonModule, NgIcon],
   templateUrl: `./category-progress-list.component.html`,
   styleUrls: ['./category-progress-list.component.scss'],
})
export class CategoryProgressListComponent {
   @Input() title: string = '';
   @Input() data: any[] = [];
   @Input() totalAmount: number = 0;
   @Input() type: 'income' | 'expense' = 'expense';

   parseIcon(name: string) {
      const match = name.match(/(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u);
      return match ? match[0] : '🏷️';
   }

   parseName(name: string) {
      return (
         name.replace(/(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u, '').trim() ||
         'Danh mục'
      );
   }
}
