import { Component, input, output } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Servicio } from '../../models/modelos';

@Component({
  selector: 'app-servicio-card',
  imports: [CurrencyPipe, NgClass],
  templateUrl: './servicio-card.html',
})
export class ServicioCard {
  servicio = input.required<Servicio>();
  solicitar = output<Servicio>();
}