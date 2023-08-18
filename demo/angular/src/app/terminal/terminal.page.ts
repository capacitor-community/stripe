import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TerminalPage {

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) { }


}
