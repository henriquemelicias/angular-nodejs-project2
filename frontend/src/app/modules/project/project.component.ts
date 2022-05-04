import { Component, OnInit } from '@angular/core';
import { ProjectService } from './project.service';
import { Project } from '@modules/project/project';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})


export class ProjectComponent implements OnInit {

  constructor( private ProjectService: ProjectService ) {}


  ngOnInit(): void {
    
    let date = new Date().toISOString().slice(0, 10);

  }

  addProject(name : string , acronym : string , startDate : Date , endDate : Date){
    const p:Project = { name: name, acronym:acronym , startDate:startDate , endDate:endDate, tasks:[] };
    this.ProjectService.addProject(p);
  }

}
