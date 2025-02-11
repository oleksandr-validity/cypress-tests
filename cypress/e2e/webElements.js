/// <reference types="cypress" />

import NavigationPage from "../support/page_objects/navigation.page";
import {onDatePickerPage} from "../support/page_objects/datepicker.page";
const navigateTo = new NavigationPage()
describe('Interaction with Web Elements', ()=>{
  beforeEach('Open main page',()=> {
    cy.openHomePage()
  })

  context('Form Layouts page', ()=>{
    beforeEach(()=> {
      navigateTo.formLayoutsPage()
    })

    it('Saving and working with subject', ()=>{
      // SAVING SUBJECT OF THE COMMAND
      // approach #1 - Alias: can be used as a global variable within one test suite
      cy.contains('nb-card', 'Using the Grid').as('usingGrid')
      cy.get('@usingGrid').find('[for="inputEmail1"]').should('contain', 'Email')
      cy.get('@usingGrid').find('[for="inputPassword2"]').should('contain', 'Password')

      // approach #2 - then() method can me using within one method
      cy.contains('nb-card', 'Using the Grid').then(usingGrid =>{
        cy.wrap(usingGrid).find('[for="inputEmail1"]').should('contain', 'Email')
        cy.wrap(usingGrid).find('[for="inputPassword2"]').should('contain', 'Password')
      })
    })

    it('Extracting text values', ()=> {
      // #1
      cy.get('[for="exampleInputEmail1"]').should('contain', 'Email address')

      // #2 jQuery element
      cy.get('[for="exampleInputEmail1"]').then(label => {
        const labelText = label.text()
        expect(labelText).to.eq('Email address')
      })

      // #3 Invoke text from element
      cy.get('[for="exampleInputEmail1"]').invoke('text').should('contain', 'Email address')

      // #4 Invoke attr value from element
      cy.get('[for="exampleInputEmail1"]').invoke('attr','class').then(classValue => {
        expect(classValue).to.eq('label')
      })

      // #5 - Find hidden input value in the properties of the element to validate
      cy.get('#exampleInputEmail1').type('text.com')
      cy.get('#exampleInputEmail1').invoke('prop','value').should('contain','text.com')
    })

    it('Radio buttons', ()=> {

      cy.contains('nb-card', 'Using the Grid').find('[type="radio"]').then(radioButtons => {
        cy.wrap(radioButtons).eq(0).check({force: true}).should("be.checked")
        cy.wrap(radioButtons).eq(1).check({force: true}).should("be.checked")
        cy.wrap(radioButtons).eq(0).should("not.be.checked")
        cy.wrap(radioButtons).eq(2).should("be.disabled")
      })
    })
  })

  context('Toastr page', ()=> {

    beforeEach(()=> {
      navigateTo.toastrPage()
    })

    it('Check boxes', () => {
      cy.get('[type="checkbox"]').check({force: true}) //if 3 elements found, it will check all checkboxes found

      // CLICK vs CHECK.
      // "Click" will click on checkbox no matter it is checked or not
      // "Check" performs validation of element(checkbox) status and check it if it is unchecked. If checked it will keep it checked
      cy.get('[type="checkbox"]').eq(0).click({force: true})
      cy.get('[type="checkbox"]').eq(1).check({force: true})

    })
  })

  it('Datepicker page', ()=> {
    navigateTo.datePickerPage()
    onDatePickerPage.selectCommonDatepickerDateFromToday(200)
  })

  it('Lists and Dropdowns',()=>{

    // #1 Select 1 option in dropdown
    cy.get('nav nb-select').click()
    cy.get('nb-option').contains('Dark').click()
    cy.get('nav nb-select').should('contain.text', 'Dark')

    // #2 Loop through all options
    cy.get('nav nb-select').then(dropdown => {
      cy.wrap(dropdown).click()
      cy.get('ul.options-list nb-option').each((option, index) =>{
        let optionColor = option.text().trim()
        cy.wrap(option).click()
        cy.wrap(dropdown).should('contain', optionColor)
        if( index < 3) {
          cy.wrap(dropdown).click()
        }
      })
    })
  })

  it('Table filtering', ()=>{
    navigateTo.smartTablePage()

    //Get each row validation
    const age = [20, 30, 40, 200]

    cy.wrap(age).each( age => {
      cy.get('thead input[placeholder="Age"]').clear().type(age)
      cy.wait(1000)
      cy.get('tbody tr').each(row => {
        if (age !== 200){
          cy.wrap(row).find('td').eq(6).should('contain', age)
        } else {
          cy.wrap(row).should("contain", "No data found")
        }
      })
    })
  })

  it('Dialog Box', ()=> {
    navigateTo.smartTablePage()

    // #1 - problem:  if window confirm event will not fire, validation will not run.
    // we will not catch that window was not opened. Test will pass always
    cy.get('tbody tr').first().find('.nb-trash').click()
    cy.on('window:confirm', (confirm) => {
      expect(confirm).eq('Are you sure you want to delete?')
    })

    // #2 - benefit: if window did not show up, stub will be empty. And when we call this object it will not have any message.
    const stub = cy.stub()
    cy.on('window:confirm', stub)
    cy.get('tbody tr').first().find('.nb-trash').click().then(()=> {
      expect(stub.getCall(0)).to.be.calledWith('Are you sure you want to delete?')
    })

    // #3 - click cancel in the pop-up/dialog window
    cy.get('tbody tr').first().find('.nb-trash').click()
    cy.on('window:confirm', () => false)
  })

})
