import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string'


let defaultStyle = {
  color: '#fff'
}

class PlaylistCounter extends Component {
  render() {
    return (
      <div style={{ ...defaultStyle, width: '40%', display: 'inline-block' }}>
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
    return (
      <div style={{ ...defaultStyle, width: '40%', display: 'inline-block' }}>
        <h2>{Math.round(totalDuration / 3600)} hours</h2>
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
        <h3 style={{ display: 'inline-block' }}>  Search </h3>
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return (
      <div style={{ ...defaultStyle, display: 'inline-block', width: "30%" }}>
        <img src={playlist.imageURL} style={{ width: '60px' }} />
        <h3 style={{ color: 'Black' }}>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song =>
            <li>{song.name} - {song.popularity}</li>
          )}
        </ul>
      </div>
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
                popularity: trackData.popularity
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
            songs: item.trackDatas.slice(0,8)
          }
        })
      }))
  }


  render() {
    let playlistToRender = this.state.user && this.state.playlists ? this.state.playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase())) : []
    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{ ...defaultStyle, 'font-size': '54px' }}>
              {this.state.user.name}'s playlists
          </h1>
            <PlaylistCounter playlists={playlistToRender} />
            <HoursCounter playlists={playlistToRender} />
            <Filter onTextChange={text => this.setState({ filterString: text })} />
            {playlistToRender
              .map(playlist =>
                <Playlist playlist={playlist} />
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
