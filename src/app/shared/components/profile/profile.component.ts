import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @Input() fullName: string = '';
  @Output() closeSession: EventEmitter<boolean> = new EventEmitter<boolean>();

  onCloseSession() {
    this.closeSession.emit(true);
  }
}
