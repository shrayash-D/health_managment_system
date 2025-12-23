import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:"",
        loadComponent: () => import('./hero-section/hero-section.component').then(m => m.HeroSectionComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./contact-us/contact-us.component').then(m => m.ContactUsComponent)
    }
];
