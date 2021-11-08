import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html'
})
export class RegisterFormComponent {
  registerForm = new FormGroup(
    {
      fullName: new FormControl('', [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(100)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required, 
        Validators.minLength(8),
        least2UpperCasePassword,
        leastSpecialPassword,
        leastNumberPassword
      ]),
      rePassword: new FormControl('', [Validators.required])
    }
  );
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  isSamePassword: boolean = false;

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }
  
  get password() {
    return this.registerForm.get('password');
  } 

  get rePassword() {
    return this.registerForm.get('rePassword');
  }

  validateSame(event: any) {
    if(this.password?.value !== event.target.value ) {
      this.isSamePassword = false;
    } else {
      this.isSamePassword = true;
    }
  }

  onSubmit() {
    if (this.password?.value !== this.rePassword?.value) {
      return;
    }

    this.submit.emit({ 
      fullName: this.fullName?.value,
      email: this.email?.value, 
      password: this.password?.value 
    });
  }

  onCancel() {
    this.cancel.emit(true);
  }
}

export function least2UpperCasePassword(control: AbstractControl): ValidationErrors | null { 
  const value: string = control.value;
  const regx =  /^(.*?[A-Z]){2,}/

  if (!regx.test(value)) {
    return { 'least2UpperCasePassword': true };
  }  

  return null;
}

export function leastSpecialPassword(control: AbstractControl): ValidationErrors | null { 
  const value: string = control.value;
  const regex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

  if (!regex.test(value)) {
    return { 'leastSpecialPassword': true };
  }  

  return null;
}

export function leastNumberPassword(control: AbstractControl): ValidationErrors | null { 
  const value: string = control.value;
  const regex = /^(.*?[1-9])/

  if (!regex.test(value)) {
    return { 'leastNumberPassword': true };
  }  

  return null;
}
