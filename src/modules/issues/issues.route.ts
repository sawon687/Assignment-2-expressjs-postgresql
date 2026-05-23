import { Router } from 'express';
import issuesController from './issues.controller';
import { auth } from '../../middleware/auth';


const route=Router()

route.post('/',auth() ,issuesController.createIssues)
route.get('/',issuesController.getAllIssues)
route.get('/:id',issuesController.singleIssues)
route.delete('/:id',auth('maintainer'),issuesController.deleteIssues)
route.put('/:id',auth('maintainer','contributor'),issuesController.updateIssues)

export const issuesRoute=route