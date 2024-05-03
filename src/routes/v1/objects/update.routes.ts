// import { createPost } from '@db/queries/post';
import { routes } from '@stricjs/app';
// import { jsonv } from '@stricjs/app/parser';
import { status, text } from '@stricjs/app/send';

export default routes('/update')
.post('/', ctx => {
    // const $id = Date.now().toString();
    const $id = "Hello WORLD";

    // Create post
    // createPost.run({
    //     $id, $author: ctx.state.name,
    //     $title: ctx.state.title,
    // });

    return text($id);
});