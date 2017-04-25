describe('Service: users.csvCustomProductMapper', function () {
  // load the service's module
  beforeEach(module('mean'))

  // instantiate service
  var service

  // update the injection
  beforeEach(inject(function (_csvCustomProductMapper_) {
    service = _csvCustomProductMapper_
  }))

  /**
   * @description
   * Sample test case to check if the service is injected properly
   * */
  it('should be injected and defined', function () {
    expect(service).toBeDefined()
  })

  it('should parse csv list with comma delimiter', function () {
    expect(service.mapList('1,2,3').length).toEqual(3)
    expect(service.mapList('1,2,3').join(',')).toEqual('1,2,3')
  })

  it('should parse csv list with semicolon delimiter', function () {
    expect(service.mapList('1;2;3').length).toEqual(3)
    expect(service.mapList('1;2;3').join(';')).toEqual('1;2;3')
    expect(service.mapList('1,aa;2;3').length).toEqual(3)
    expect(service.mapList('1,aa;2;3').join(';')).toEqual('1,aa;2;3')
  })

  it('should apply mapping to csv products', function () {
    var csvProduct = {
      csvName: 'Product Name',
      csvText: 'string',
      csvNumber: '123',
      csvBool1: 'true',
      csvBool2: '1',
      csvUrl: 'http://www.google.com/',
      csvList1: '"1, 2, 3, 4, 5"',
      csvList2: '1; 2; 123',
      csvDate: '2016-09-23',
      csvYoutube: '0pxaHyz_E5w'
    }

    var mappingColumns = [
      { mapping: 'name', name: 'csvName' },
      { new: true, mapping: 'My Text', fieldType: 'text', name: 'csvText' },
      { new: true, mapping: 'My Number', fieldType: 'number', name: 'csvNumber' },
      { new: true, mapping: 'My Boolean 1', fieldType: 'boolean', name: 'csvBool1' },
      { new: true, mapping: 'My Boolean 2', fieldType: 'boolean', name: 'csvBool2' },
      { new: true, mapping: 'My URL', fieldType: 'url', name: 'csvUrl' },
      { new: true, mapping: 'My List 1', fieldType: 'list', name: 'csvList1' },
      { new: true, mapping: 'My List 2', fieldType: 'list', name: 'csvList2' },
      { new: true, mapping: 'My Date', fieldType: 'date', name: 'csvDate' },
      { new: true, mapping: 'My Youtube Link', fieldType: 'youtube', name: 'csvYoutube' }
    ]

    var product = service.mapProducts([csvProduct], mappingColumns)[0]
    expect(product.name).toEqual('Product Name')
    expect(product.properties.my_text.value).toEqual('string')
    expect(product.properties.my_number.value).toEqual(123)
    expect(product.properties.my_boolean_1.value).toEqual(true)
    expect(product.properties.my_boolean_2.value).toEqual(true)
    expect(product.properties.my_url.value).toEqual('http://www.google.com/')
    expect(product.properties.my_list_1.value.join(',')).toEqual('1,2,3,4,5')
    expect(product.properties.my_list_2.value.join(',')).toEqual('1,2,123')
    expect(product.properties.my_date.value).toEqual(new Date(Date.UTC(2016, 8, 23)))
    expect(product.properties.my_youtube_link.value).toEqual('https://www.youtube.com/embed/0pxaHyz_E5w')
  })
})
