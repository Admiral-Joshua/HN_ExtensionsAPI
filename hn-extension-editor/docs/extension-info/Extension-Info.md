---
tags: [Extension Info]
---

# Extension Info

A set of RESTful endpoints and data structures to outline a new or update an existing Hacknet Extension.

## ExtensionInfo Model
```json json_schema
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    }
  }
}
```

## GET - Extension Info
Fetches information about an extension with the given ID, after verifying the user is permitted to access this extension.
```json http
{
  "method": "get",
  "url": "https://hn.lunasphere.co.uk/extensions/{id}"
}
```

## CREATE - Create New Extension
Creates a brand new extension for the current user with uploaded information.
```json http
{
  "method": "post",
  "url": "https://hn.lunasphere.co.uk/extensions/new"
}
```

## UPDATE - Update Extension Info
Updates an extension information with submitted new information under the specified extension ID.
```json http
{
  "method": "post",
  "url": "https://hn.lunasphere.co.uk/extensions/update/{id}"
}
```

## DELETE - Delete an Extension
Deletes an Extension with the given ID.
```json http
{
  "method": "delete",
  "url": "https://hn.lunasphere.co.uk/extensions/delete/{id}"
}
```
*WARNING! This last method is highly destructive, and so it is recommended that a user be prompted for confirmation before proceeding.*
