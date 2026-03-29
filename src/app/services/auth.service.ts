import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(public router: Router, public firebaseAuth: Auth) {}
  public errorMessage: string | null = null
  public user: string | null = null

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => {
        this.router.navigate(['/dashboard']);
        this.errorMessage = null;
      })
      .catch((error) => {
        this.errorMessage = 'Incorrect. Please try again.';
      })
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.firebaseAuth, provider)
      .then(() => {
        this.router.navigate(['/dashboard']);
        this.errorMessage = null;
      })
      .catch((error) => {
        this.errorMessage = 'Google sign-in failed. Please try again.';
      });
  }

  isLoggedIn(): boolean {
    return !this.firebaseAuth.currentUser;
  }

  logOut() {
    this.firebaseAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  authentication() {
    onAuthStateChanged(this.firebaseAuth, user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
