import { Routes } from '@angular/router';
import { LaserEditor } from './laser-editor/laser-editor';
import { Ranking } from './ranking/ranking';

export const routes: Routes = [
  { path: '', component: LaserEditor },
  { path: 'ranking', component: Ranking }
];
