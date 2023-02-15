import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { map, Observable, startWith } from 'rxjs'

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
})
export class DemoComponent {
  formGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-z0-9\_]+$/i),
      Validators.minLength(4),
      Validators.maxLength(16),
    ]),
  })
  _string: string = ''
  _number: number = 50
  _A: number = 0
  _B: number = 100
  _boolean: boolean = false

  _colors = ['primary', 'accent', 'warn']

  _searching: FormControl = new FormControl('')
  _filtered: Observable<string[]>
  _separatorKeysCodes: number[] = [ENTER, COMMA]
  _categories = ['Software', 'Hardware', 'AI', 'Crypto']
  categories: Set<string> = new Set()

  _formatLabel(value: number): string {
    return `${value}%`
  }

  constructor() {
    this._filtered = this._searching.valueChanges.pipe(
      startWith(null),
      map((cat: string) =>
        cat
          ? this._categories.filter((c) =>
              c.toLowerCase().includes(cat.toLowerCase())
            )
          : this._categories.slice()
      )
    )
  }

  submit() {
    console.log('submitted')
  }

  add($event: MatChipInputEvent | MatAutocompleteSelectedEvent) {
    let value
    if ('value' in $event) value = $event.value
    else value = $event.option.value

    if (this._categories.includes(value)) {
      this.categories.add(value)
      this._searching.setValue('')
    }
  }
}
