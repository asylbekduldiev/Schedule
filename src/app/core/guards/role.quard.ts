import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../../auth/auth.service";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.currentUser;
    const roles = route.data['roles'] as string[];
    if (user && roles.includes(user.role)) return true;

    this.router.navigate(['/auth']);
    return false;
  }
}