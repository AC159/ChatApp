const socket = io()

// Elements:
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates:
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // 'ignoreQueryPrefix' removes the '?' character


socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        message: message.text,  // Provide variable to render in the html template
        createdAt: moment(message.createdAt).format('HH:mm:ss a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // prevent browser refresh

    // Disable the form:
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value // Get the message string

    socket.emit('sendMessage', message, (error) => {

        // Re-enable the form:
        $messageFormButton.removeAttribute('disabled')

        // Clear the form input & set the focus:
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })

})

socket.on('locationMessage', (location) => {
    console.log(location)

    const html = Mustache.render(locationMessageTemplate, {
        url: location.url,
        location_createdAt: moment(location.createdAt).format('HH:mm:ss a')
    })

    // Append to messages list:
    $messages.insertAdjacentHTML('beforeend', html)
})

$sendLocationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    // Disable the button:
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            console.log('Location shared!')

            // Re-enable the send-location button:
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', { username, room }, (error) => {

    if (error) {
        alert(error)
        // Redirect user to home page:
        location.href = '/'
    }

})