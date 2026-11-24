import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup, FormControl, FormGroupDirective,
  Validators
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Game } from './models/game';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  games: Game[] = [];

  // id del videojuego que se está editando (undefined = alta nueva)
  editingId?: number;

  // mensaje de resultado tras guardar (creación, actualización o error)
  message = '';
  messageIsError = false;

  // Modelo del formulario declarado de forma explícita en TypeScript.
  // Las reglas que antes estaban en el HTML (required, minlength, min...) pasan a Validators.
  gameForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(40)]
    }),
    genre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    platform: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01), Validators.max(100)]
    }),
    stock: new FormControl(0, {
      nonNullable: true,
      // pattern /^\d+$/ -> solo enteros no negativos (1.5 o -1 no cumplen)
      validators: [Validators.required, Validators.min(0), Validators.max(999), Validators.pattern(/^\d+$/)]
    })
  });

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getGames().subscribe(data => {
      this.games = data;
    });
  }

  saveGame(form: FormGroupDirective): void {
    // Al enviar, Angular pone form.submitted = true automáticamente.
    this.gameForm.markAllAsTouched();

    if (this.gameForm.invalid) {
      return; // no se contacta con JSON Server
    }

    const game: Game = this.gameForm.getRawValue();

    if (this.editingId) {
      // tiene id -> edicion -> PUT
      this.gameService.updateGame({ ...game, id: this.editingId }).subscribe({
        next: () => this.afterSave(form, 'Videojuego actualizado correctamente.'),
        error: () => this.showError('No se pudo actualizar el videojuego. ¿Está arrancado JSON Server?')
      });
    } else {
      // no tiene id -> alta -> POST
      this.gameService.createGame(game).subscribe({
        next: () => this.afterSave(form, 'Videojuego creado correctamente.'),
        error: () => this.showError('No se pudo crear el videojuego. ¿Está arrancado JSON Server?')
      });
    }
  }

  editGame(game: Game): void {
    this.editingId = game.id;
    this.message = '';
    this.gameForm.setValue({
      title: game.title,
      genre: game.genre,
      platform: game.platform,
      price: game.price,
      stock: game.stock
    });
  }

  clear(form: FormGroupDirective): void {
    // resetForm restaura los valores iniciales (nonNullable) y pone submitted a false
    form.resetForm();
    this.editingId = undefined;
    this.message = '';
  }

  private afterSave(form: FormGroupDirective, text: string): void {
    this.loadGames();
    this.clear(form);
    this.message = text;
    this.messageIsError = false;
  }

  private showError(text: string): void {
    // si falla la petición se conservan los valores y el estado del formulario
    this.message = text;
    this.messageIsError = true;
  }
}
