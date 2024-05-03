// import { createPost } from '@db/queries/post';
import { routes } from '@stricjs/app';
// import { jsonv } from '@stricjs/app/parser';
import { status, text } from '@stricjs/app/send';

export default routes('/create')
    .post('/', ctx => {
        return new Response('Hello, Worldeeeeee!');
    });