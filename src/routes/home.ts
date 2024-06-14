import { RouteInterface } from '.';

export const route: RouteInterface = {
    // check for a path that's exactly '/' (home page)
    pathRegex: /^\/$/,
    method: 'get',
    handler: (req: Request) => {
        return new Response("(homepage) tbd", { status: 200 });
    }
};