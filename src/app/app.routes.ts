import { Routes } from '@angular/router';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

export const routes: Routes = [
    {
        path:"",
        // loadComponent: () => import('./hero-section/hero-section.component').then(m => m.HeroSectionComponent)
        component: HeroSectionComponent
    },
    {
        path: 'contact',
        // loadComponent: () => import('./contact-us/contact-us.component').then(m => m.ContactUsComponent)
        component: ContactUsComponent
    }
];
