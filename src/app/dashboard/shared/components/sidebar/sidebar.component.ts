import { Component, Inject, Renderer2, OnDestroy, ElementRef } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {

  showMenu = false;
  private clickListener: () => void;

  constructor(
    @Inject(AuthService) private authService: AuthService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.clickListener = this.renderer.listen('document', 'click', this.onDocumentClick.bind(this));
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.authService.logOut();
  }

  onDocumentClick(event: Event) {
    if (this.showMenu && !this.el.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}
