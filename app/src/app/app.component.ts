import { Component, OnInit } from '@angular/core';
import { ProjectService } from './shared/services/project.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private projectService: ProjectService) {}

  async ngOnInit() {
    await this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      const hasData = await this.projectService.hasData();
      if (!hasData) {
        console.log('First launch detected, seeding mock data...');
        await this.projectService.seedMockData();
        console.log('Mock data seeded successfully');
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }
}
