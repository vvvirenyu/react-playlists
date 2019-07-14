import React, { Component } from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string'
import { Route, BrowserRouter as Router } from 'react-router-dom'

let defaultStyle = {
  color: '#fff',
  'font-family': 'Arial'
}

let counterStyle = {
  ...defaultStyle
  , display: 'inline-block'
  , width: "40%"
  , 'margin-bottom': '10px'
  , 'font-size': '20px'
  , 'line-height': '30px'
  , 'font-weight': 'bold'
}

class PlaylistCounter extends Component {
  render() {
    let playlistDefaultStyle = counterStyle
    return (
      <div style={playlistDefaultStyle}>
        <h2> {this.props.playlists.length} Playlists </h2>
      </div>
    )
  }
}

class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylists) => {
      return songs.concat(eachPlaylists.songs)
    }, [])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    let totalDurationHours = Math.round(totalDuration / 3600)
    let isTooLow = totalDurationHours < 5
    let hoursDefaultStyle = {
      ...counterStyle
      , color: isTooLow ? 'red' : 'white'
    }
    return (
      <div style={hoursDefaultStyle}>
        <h2>{totalDurationHours} hours</h2>
      </div>
    )
  }
}
class Filter extends Component {
  render() {
    return (
      <div style={{ ...defaultStyle, padding: '30px' }}>
        <img />
        <input type="text" onKeyUp={event => this.props.onTextChange(event.target.value)} />
        <h3 style={{ ...defaultStyle, 'font-weight': 'bold', display: 'inline-block', padding: '5px' }}>  Search </h3>
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return (
      <Router>
        <div style={{
          ...defaultStyle
          , display: 'inline-block'
          , width: "30%"
          , 'margin-bottom': '10px'
          , padding: '10px'
          , 'background-color': this.props.index % 2 ? '#008080' : '#DC7B66'
        }}>
          <h3 style={{ 'font-weight': 'bold', color: '#141417', padding: '5px' }}>{playlist.name}</h3>
          <img src={playlist.imageURL} style={{ width: '60px', padding: '15px' }} />
          <ul>
            {playlist.songs.map(song =>
              <li> <a style={{'color': '#FFF'}} target="_blank" href={song.query}>{song.name} - {song.popularity}</a> </li>
            )}
          </ul>
        </div>
      </Router>
    );
  }
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {},
      filterString: ''
    }
  }

  componentDidMount() {
    let parsed = queryString.parse(window.location.search);
    let token = parsed.access_token;
    if (!token)
      return;
    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(response => response.json())
      .then(data => this.setState({ user: { name: data.display_name } }))

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(response => response.json())
      .then(playlistData => {
        let pls = playlistData.items
        let trackDataPromises = pls.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: { 'Authorization': 'Bearer ' + token }
          })
          let trackDataPromise = responsePromise.then(response => response.json())
          return trackDataPromise
        })
        let allTracksDataPromise = Promise.all(trackDataPromises)
        let playlistsPromise = allTracksDataPromise.then(trackDatas => {
          trackDatas.forEach((trackData, i) => {
            pls[i].trackDatas = trackData.items.map(item => item.track)
              .map(trackData => ({
                name: trackData.name,
                duration: trackData.duration_ms / 1000,
                popularity: trackData.popularity,
                query: 'http://www.google.com/search?q=' + trackData.name + '+by+' + trackData.artists[0].name
              }))
          })
          return pls
        })
        return playlistsPromise
      })
      .then(playlists => this.setState({
        playlists: playlists.map(item => {
          return {
            name: item.name,
            imageURL: item.images[0].url,
            songs: item.trackDatas.slice(0, 8),
            extLink: item.href
          }
        })
      }))
  }


  render() {
    let playlistToRender = this.state.user && this.state.playlists ? this.state.playlists.filter(playlist => {
      let matchedPlaylists = playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase())
      let matchedSongs = playlist.songs.find(song => song.name.toLowerCase().includes(this.state.filterString.toLowerCase()))
      return matchedPlaylists || matchedSongs
    })
      : []
    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{
              ...defaultStyle
              , 'font-size': '54px'
              , 'margin-top': '50px'
              , 'font-family': 'zapfino'
            }}>
              {this.state.user.name}'s playlists
          </h1>
            <PlaylistCounter playlists={playlistToRender} />
            <HoursCounter playlists={playlistToRender} />
            <Filter onTextChange={text => this.setState({ filterString: text })} />
            {playlistToRender
              .map((playlist, i) =>
                <Playlist playlist={playlist} index={i} />
              )}
          </div> : <button onClick={() => { window.location = window.location.href.includes('localhost') ? 'http://localhost:8888/login' : 'https://react-playlists-backend.herokuapp.com/login' }
          }
            style={{ 'font-size': '40px', 'margin-top': '30px', 'padding': '20px' }}> Sign In With Spotify </button>
        }
      </div>
    );
  }
}

export default App;
