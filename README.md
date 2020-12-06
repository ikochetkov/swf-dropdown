Dropdown
===============================================
Customized dropdown list, inherits default behavior of now-dropdown component and allows to search through choice list.
To enable search add property search="contains"

How to use:
1. Install component: npm install @storeworkflows/dropdown
2. add to your file: import "@storeworkflows/dropdown"
3. Example usage:

    <swf-dropdown 
      items={[{ "id": "ar", "label": "Arkansas" }, { "id": "co", "label": "Colorado" }]}
      select="single"
      search="contains"
      icon=""
      variant="secondary"
      size="md"
      tooltipContent=""
      panelFitProps={{}}
      configAria={{}}
    />

4. Dispatches actions:
 - SWF_DROPDOWN#OPENED_SET - when panel open/closed, payload contains opened state
 - SWF_DROPDOWN_LIST#SELECTED_ITEMS_SET - on item selection, payload contains selected values
 - SWF_DROPDOWN_LIST#ITEM_CLICKED - maybe not needed
 - SWF_DROPDOWN_LIST#ACTIVE_ITEM_SET - on item hover/arrowUp(Down)
 - SWF_DROPDOWN_LIST#SEARCH_TERM_SET - on search input

