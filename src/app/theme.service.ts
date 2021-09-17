import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public renderer: Renderer2;
  public currentTheme;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
    ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  activeTheme(item) {
    this.renderer.removeClass(this.document.body, this.currentTheme);
    this.currentTheme = item;
    this.renderer.addClass(this.document.body, item);
  }
}
