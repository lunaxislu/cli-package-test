import fg from 'fast-glob';
import { ProjectType } from './get-project-info';

const PROJECT_SHARED_IGNORE = [
    "**/node_modules/**",
    ".next",
    "public",
    "dist",
    "build",
  ];


export async function getResolveNextType(cwd:string,projectType:ProjectType){
    if(!isSrc) return null
    const resolvePath = await fg.glob('pages.*',{
        cwd,
        deep:2,
        ignore:PROJECT_SHARED_IGNORE
    })

    const isAppRouter = resolvePath.length >
}