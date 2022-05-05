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
  date: String | undefined;


  ngOnInit(): void {
    
    this.date = new Date().toISOString().slice(0, 10);

  }

  addProject(name : string , acronym : string , startDate : string , endDate : string){

    let sDate = new Date(parseInt(startDate.split("-")[0]),parseInt(startDate.split("-")[1]),parseInt(startDate.split("-")[2]))
    let eDate = new Date(parseInt(endDate.split("-")[0]),parseInt(endDate.split("-")[1]),parseInt(endDate.split("-")[2]))

    const p:Project = { name: name, acronym:acronym , startDate:sDate , endDate:eDate, tasks:[] };

    this.ProjectService.addProject(p);

  }

}
