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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // 'ignoreQueryPrefix' removes the '?' character


const autoScroll = () => {
    // New message element:
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage) // Get the bottom margin value
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Get the visible height:
    const visibleHeight = $messages.offsetHeight

    // Height of messages container:
    const containerHeight = $messages.scrollHeight  // total height we can scroll through

    // How far down have I scrolled from top of page?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message', (messageObj) => {
    // console.log(messageObj)

    const html = Mustache.render(messageTemplate, {
        username: messageObj.username,
        message: messageObj.text,  // Provide variable to render in the html template
        createdAt: moment(messageObj.createdAt).format('HH:mm:ss a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


socket.on('roomData', ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // prevent browser refresh

    // Disable the form:
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value // Get the message string

    socket.emit('sendMessage', message , (error) => {

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

socket.on('locationMessage', (locationObj) => {
    // console.log(location)

    const html = Mustache.render(locationMessageTemplate, {
        username: locationObj.username,
        url: locationObj.url,
        location_createdAt: moment(locationObj.createdAt).format('HH:mm:ss a')
    })

    // Append to messages list:
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$sendLocationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    // Disable the button:
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        const obj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }

        socket.emit('sendLocation', obj, () => {
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