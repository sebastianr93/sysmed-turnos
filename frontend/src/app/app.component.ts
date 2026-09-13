import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.removeCalendarTooltips();
  }

  private removeCalendarTooltips(): void {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(
        '.mat-calendar-previous-button, .mat-calendar-next-button'
      ).forEach(btn => {
        btn.removeAttribute('aria-label');
        btn.removeAttribute('title');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
