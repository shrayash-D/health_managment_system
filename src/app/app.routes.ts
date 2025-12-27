import { Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { AuthGuard } from './services/auth.guard';
import { UsersignupComponent } from './usersignup/usersignup.component';
export const routes: Routes = [
    {
        path:"",
        component:LoginComponent,
        pathMatch:'full'
    }
    ,{
        path:"profile",
        component:UserprofileComponent,
        canActivate:[AuthGuard]

    },
    {
        path:"login",
        component:LoginComponent
    },
    {
        path:"signup",
        component:UsersignupComponent
    }
];
