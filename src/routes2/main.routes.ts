import { routes } from "@stricjs/app";

export default routes('/')
    .get('/', ctx => {
        return new Response('Hello, World!');
    });