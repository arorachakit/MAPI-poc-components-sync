const MAPI_TOKEN = "YOUR_TOKEN";
const PARENT_SPACE = "PARENT SPACE ID";
const CHILD_SPACE = "CHILD SPACE ID";

const StoryblokClient = require("storyblok-js-client");

// Initialize the client with the oauth token
const Storyblok = new StoryblokClient({
  oauthToken: MAPI_TOKEN,
});

// Get child space details
async function getChildSpaceDetails() {
  console.log("Getting Child Space Details");
  let space = await Storyblok.get(`spaces/${CHILD_SPACE}`);
  return space;
}

// Get Parent Space Components
async function getParentSpaceComponents() {
  let res = await Storyblok.get(`spaces/${PARENT_SPACE}/components/`);
  return res.data.components;
}

// Get Child Space Components
async function getChildSpaceComponents() {
  let res = await Storyblok.get(`spaces/${CHILD_SPACE}/components/`);
  return res.data.components;
}

// Create Component in the Child Space
async function createChildComponent(component, child_space) {
  // check if the component has any specific changes
  let checked_component = await customizeComponent(component, child_space);

  await Storyblok.post(`spaces/${CHILD_SPACE}/components/`, {
    component: checked_component,
  });

  console.log(`Component ${checked_component.name} Created in the Child Space`);
}

// Update Component in the Child Space
async function updateChildComponent(component, child_space, child_component) {
  component.id = child_component.id;
  // check if the component has any specific changes
  let checked_component = await customizeComponent(component, child_space);
  console.log(component.schema);

  // Don't update if the schema is same
  //   This is currently just checking schema, this step can be skipped or changed to inculde more fields depending upon the requirements
  if (
    JSON.stringify(child_component.schema) ==
    JSON.stringify(checked_component.schema)
  ) {
    console.log(
      `Schema exatcly same, no update needed for component ${component.name}`
    );
    return;
  }

  console.log(`Updating component ${component.name}`);
  await Storyblok.put(
    `spaces/${CHILD_SPACE}/components/${child_component.id}`,
    {
      component: checked_component,
    }
  );
  console.log(`${component.name} Updated in the Child Space`);
}

// Check and Apply a Sepcific Change for Child Space
async function customizeComponent(component, child_space) {
  // Updates and changes to a component - space specific

  //   Example: Inside the child space, change the schema of component named 'test-component'
  //    Make, change the field named 'options' to use c.json instead of p.json

  if (CHILD_SPACE == 'ENTER A SPACE ID') {
    if (component.name == "test-component") {
      component.schema.options.external_datasource = "b.json";
    }
  }
  return component;
}

async function main_script() {
  try {
    // get child space details
    let child_space = await getChildSpaceDetails();

    //get the list of child components
    let existing_child_components = await getChildSpaceComponents();
    // map their names in an array (let's save some memory)
    let name_map = existing_child_components.map((c) => c.name);

    // get the list of parent component
    let parent_components = await getParentSpaceComponents();

    // for every parent component -
    parent_components.map(async (parent_component) => {
      // check if component is not present in the child space
      if (!name_map.includes(parent_component.name)) {
        // if not, then create a new component
        console.log(`Component ${parent_component.name} not present`);
        console.log(`Creating component ${parent_component.name}`);
        await createChildComponent(parent_component, child_space);
        return;
      }

      // if component present in the child space then update the component

      console.log(`Component ${parent_component.name} already present`);

      // get the child component
      let child_component = existing_child_components.find(
        (c) => c.name == parent_component.name
      );
      await updateChildComponent(
        parent_component,
        child_space,
        child_component
      );
    });
  } catch (err) {
    console.log(err);
  }
}

main_script();
