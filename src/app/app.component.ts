import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Game } from './models/game';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  games: Game[] = [];

  game: Game = this.emptyGame();

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadGames();
  }

  emptyGame(): Game {
    return {
      title: '',
      genre: '',
      platform: '',
      price: 0,
      stock: 0
    };
  }

  loadGames(): void {
    this.gameService.getGames().subscribe(data => {
      this.games = data;
    });
  }

  saveGame(gameForm: NgForm): void {
    if (gameForm.invalid) {
      return;
    }

    if (this.game.id) {
      // tiene id -> edicion -> PUT
      this.gameService.updateGame(this.game).subscribe(() => {
        this.loadGames();
        this.resetForm(gameForm);
      });
    } else {
      // no tiene id -> alta -> POST
      this.gameService.createGame(this.game).subscribe(() => {
        this.loadGames();
        this.resetForm(gameForm);
      });
    }
  }

  editGame(game: Game): void {
    this.game = { ...game };
  }

  cancelEdit(gameForm: NgForm): void {
    this.resetForm(gameForm);
  }

  resetForm(gameForm: NgForm): void {
    // resetForm deja el formulario en pristine y untouched
    gameForm.resetForm(this.emptyGame());
    this.game = this.emptyGame();
  }
}
