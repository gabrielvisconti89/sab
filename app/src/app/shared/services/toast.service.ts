import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface ToastOptions {
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private defaultDuration = 3000;
  private defaultPosition: 'top' | 'bottom' | 'middle' = 'bottom';

  constructor(private toastController: ToastController) {}

  async presentSuccess(message: string, options?: Partial<ToastOptions>): Promise<void> {
    await this.present({
      message,
      icon: 'checkmark-circle-outline',
      ...options,
    }, 'success');
  }

  async presentError(message: string, options?: Partial<ToastOptions>): Promise<void> {
    await this.present({
      message,
      icon: 'alert-circle-outline',
      duration: 4000, // Errors stay longer
      ...options,
    }, 'danger');
  }

  async presentWarning(message: string, options?: Partial<ToastOptions>): Promise<void> {
    await this.present({
      message,
      icon: 'warning-outline',
      ...options,
    }, 'warning');
  }

  async presentInfo(message: string, options?: Partial<ToastOptions>): Promise<void> {
    await this.present({
      message,
      icon: 'information-circle-outline',
      ...options,
    }, 'primary');
  }

  private async present(options: ToastOptions, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message: options.message,
      duration: options.duration ?? this.defaultDuration,
      position: options.position ?? this.defaultPosition,
      icon: options.icon,
      color,
      cssClass: 'custom-toast',
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }
}
