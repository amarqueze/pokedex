import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss']
})
export class InputSearchComponent {
  @Input() text: string = '';
  @Output() textChange: EventEmitter<string> = new EventEmitter<string>();

  onKey(event: any) {
    this.textChange.emit(event.target.value);
  }
}
