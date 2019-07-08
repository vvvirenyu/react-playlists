import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string'


let defaultStyle = {
  color: '#fff'
}

let fakeServerData = {
  user: {
    name: 'Viren',
    playlists: [{
      name: 'chill like daddy',
      songs: [{
        name: 'a',
        duration: 120
      },
      {
        name: 'b',
        duration: 120
      },
      {
        name: 'c',
        duration: 120
      },]
    },
    {
      name: 'prescription  420',
      songs: [{
        name: 'a',
        duration: 120
      },
      {
        name: 'b',
        duration: 120
      },
      {
        name: 'c',
        duration: 120
      },]
    },
    {
      name: 'cherry picked',
      songs: [{
        name: 'a',
        duration: 120
      },
      {
        name: 'b',
        duration: 120
      },
      {
        name: 'c',
        duration: 120
      },]
    },
    {
      name: 'from the vault',
      songs: [{
        name: 'a',
        duration: 120
      },
      {
        name: 'b',
        duration: 120
      },
      {
        name: 'c',
        duration: 120
      },]
    },
    {
      name: 'call me naive',
      songs: [{
        name: 'a',
        duration: 120
      },
      {
        name: 'b',
        duration: 120
      },
      {
        name: 'c',
        duration: 120
      },]
    },]
  }
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
        <h2>{Math.round(totalDuration / 60)} hours</h2>
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
        <h3 style={{display: 'inline-block'}}>  Search </h3>
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return (
      <div style={{ ...defaultStyle, display: 'inline-block', width: "25%" }}>
        <img src={playlist.imageURL} style={{ width: '265px' }} />
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song =>
            <li>{song.name}</li>
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

    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(response => response.json())
      .then(data => this.setState({ user: { name: data.display_name } }))

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(response => response.json())
      .then(data => this.setState({
        playlists: data.items.map(item => {
          return {
            name: item.name,
            imageURL: item.images[1].url,
            songs: []
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
              {this.state.user.name}'s Playlists
          </h1>
            <PlaylistCounter playlists={playlistToRender} />
            <HoursCounter playlists={playlistToRender} />
            <Filter onTextChange={text => this.setState({ filterString: text })} />
            {playlistToRender
              .map(playlist =>
                <Playlist playlist={playlist} />
              )}
          </div> : <button onClick={() =>
          { window.location = window.location.href.includes('localhost')?'http://localhost:8888/login' : 'https://react-playlists-backend.herokuapp.com/login'}
          }
            style={{ 'font-size': '40px', 'margin-top': '30px', 'padding': '20px' }}> Sign In With Spotify </button>
        }
      </div>
    );
  }
}

export default App;
