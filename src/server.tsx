import { type Context, Hono } from 'hono';
import { serveStatic } from 'hono/bun';

// Data structure to hold dog information.
type Dog = { id: string; name: string; breed: string };
const dogs = new Map<string, Dog>();

/**
 * Adds a new dog to the dogs collection with a generated unique ID.
 *
 * @param name - The name of the dog
 * @param breed - The breed of the dog
 * @returns The created dog object with generated ID, name, and breed
 */
function addDog(name: string, breed: string): Dog {
  const id = crypto.randomUUID(); // standard web API
  const dog = { id, name, breed };
  dogs.set(id, dog);
  return dog;
}

// Add some initial dogs to the collection.
addDog('Fido', 'Labrador');
addDog('Rex', 'German Shepherd');

function dogRow(dog: Dog) {
  // Create a table row for the dog with its name and breed.
  return (
    <tr class="on-hover">
      <td>{dog.name}</td>
      <td>{dog.breed}</td>
      <td>
        <button
          class="show-on-hover"
          hx-delete={`/dog/${dog.id}`}
          hx-confirm="Are you sure you want to delete this dog?"
          hx-target="closest tr"
          hx-swap="delete">
          X
        </button>
      </td>
    </tr>
  );
}

// ------------------------------
// The Hono application instance.
const app = new Hono();

// Server static files from the public directory.
app.use('/*', serveStatic({ root: './public' }));

app.get('/table-rows', (c: Context) => {
  const sortedDogs = Array.from(dogs.values()).sort((a, b) => a.name.localeCompare(b.name));

  return c.html(<>{sortedDogs.map(dogRow)}</>);
});

app.post('/dog', async (c: Context) => {
  // Extract the name and breed from the form data.
  const formData = await c.req.formData();
  const name = (formData.get('name') as string) || '';
  const breed = (formData.get('breed') as string) || '';

  // Add the new dog to the collection.
  const dog = addDog(name, breed);

  // Return a Response with the new dog row and a 201 status code.
  return c.html(dogRow(dog), 201);
});

app.delete('/dog/:id', (c: Context) => {
  // Get the dog ID from the request parameters.
  const id = c.req.param('id');
  dogs.delete(id);
  return c.body(null);
});

app.get('/version', (c: Context) => {
  // Return a Response whose body contains
  // the version of Bun running on the server.
  return c.text(`Bun version: ${Bun.version}`);
});

export default app;
