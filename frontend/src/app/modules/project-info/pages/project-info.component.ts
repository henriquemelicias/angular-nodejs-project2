import { Component, OnInit } from '@angular/core';
import { ProjectService } from '@data/project/services/project.service'
import { ProjectSchema } from '@data/project/schemas/project.schema';


@Component( {
                selector: 'app-project-info',
                templateUrl: './project-info.component.html',
                styleUrls: [ './project-info.component.css' ]
            } )


export class ProjectInfoComponent implements OnInit {

    constructor( private ProjectService: ProjectService ) {}

    date: String | undefined;


    ngOnInit(): void {

        this.date = new Date().toISOString().slice( 0, 10 );

    }

    addProject( name: string, acronym: string, startDate: string, endDate: string ) {

        let sDate = new Date(
            parseInt( startDate.split( "-" )[0] ),
            parseInt( startDate.split( "-" )[1] ),
            parseInt( startDate.split( "-" )[2] )
        )
        let eDate = new Date(
            parseInt( endDate.split( "-" )[0] ),
            parseInt( endDate.split( "-" )[1] ),
            parseInt( endDate.split( "-" )[2] )
        )

        const p: ProjectSchema = { name: name, acronym: acronym, startDate: sDate, endDate: eDate, tasks: [] };

        this.ProjectService.addProject( p );

    }

}
